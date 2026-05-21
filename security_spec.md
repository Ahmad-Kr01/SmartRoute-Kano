# Security Specification & Threat Model (TDD Map)

This document defines the high-level security verification requirements and specifies 12 malicious attack payloads (the "Dirty Dozen") designed to attempt privilege escalation, integrity spoofing, and state bypassing.

## 1. Core Data Invariants

1. **Ownership Constraint**: Shipments can only be created by signed-in users whose UID matches the `ownerId` of the document.
2. **Strict Identity Validation**: Authenticated state `request.auth.uid` must match `incoming().ownerId` during any create/write event.
3. **No Guest Writes**: Unauthenticated guests cannot read, update, or create record entities in `/shipments`.
4. **Temporal Integrity**: `createdAt` must match `request.time` exactly. `updatedAt` on update must match `request.time` exactly.
5. **Terminal State Locking**: Once a shipment status is updated to `Delivered`, no further updates can be made by any user to prevent record falsification.
6. **Key Completeness**: Create schema requires exactly the 20 validated fields set inside `/firebase-blueprint.json` to prevent arbitrary shadow tags injection.

---

## 2. The "Dirty Dozen" Payloads (Vulnerability Vector Definitions)

The following attack payloads represent threats to the database rules. Standard security configurations must systematically deny these vectors with a `PERMISSION_DENIED` exception.

### Vector 1: Guest Write Bypass
*   **Attack**: Unauthenticated client attempts to create a new shipment record.
*   **Payload**:
    ```json
    {
      "id": "SRK-ATTACK-001",
      "recipient": "Vulnerable Target",
      "ownerId": "guest_attacker_1"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 2: User-Id Hijacking (Identity Spoofing)
*   **Attack**: User `attacker_uid` is signed in, but sets `ownerId` field to `victim_uid` to frame or charge another tenant.
*   **Payload**:
    ```json
    {
      "id": "SRK-ATTACK-002",
      "recipient": "Victim Terminal",
      "ownerId": "victim_uid"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 3: Client-Side Timestamp Spoofing
*   **Attack**: Client attempts to pre-date or back-date `createdAt` timestamps with a hardcoded static date to alter metrics logs.
*   **Payload**:
    ```json
    {
      "id": "SRK-ATTACK-003",
      "createdAt": "2020-01-01T00:00:00Z"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 4: Shadow Fields Injection (No excess columns)
*   **Attack**: Attacker appends a `isSystemAdmin` boolean or `bypassOtp` flag to the shipment document to acquire elevated client rights.
*   **Payload**:
    ```json
    {
      "id": "SRK-ATTACK-004",
      "recipient": "Malicious Corp",
      "isSystemAdmin": true,
      "bypassOtp": true,
      "ownerId": "attacker_uid"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 5: Path Variable ID Poisoning
*   **Attack**: Attacker attempts to inject excessive payloads directly into the document ID path parameter (e.g. `/shipments/{attacker-payload-containing-excessive-sizes-or-scary-regex}`).
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 6: Terminal State Alteration
*   **Attack**: An active shipment is already marked as `Delivered`. The attacker attempts to change the recipient or driver information on that completed docket.
*   **Payload**: Changing `recipient` to "Malicious Terminal" on a `Delivered` shipment.
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 7: Cross-Tenant Data Access (Blind List Scraping)
*   **Attack**: A signed-in client attempts to search or list all shipments without checking ownership, querying `db.collection('shipments')` blindly.
*   **Expected Behavior**: `PERMISSION_DENIED` (Rule must require owner verification on collections to protect client isolation).

### Vector 8: Improper Enums Concept Injection
*   **Attack**: Client attempts to set an invalid status value e.g. `status: "InterceptedByAir"` or some random garbage.
*   **Payload**:
    ```json
    {
      "status": "InterceptedByAir"
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 9: Negative Number Abuse
*   **Attack**: Client attempts to set a negative driver rating or extremely large numbers to crash average metric calculations.
*   **Payload**:
    ```json
    {
      "riderRating": -50.5
    }
    ```
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 10: Value Exhaustion / Denial of Wallet
*   **Attack**: Attacker triggers deep document lookups without verifying basic authentication filters as a vector to run up Firestore billings.
*   **Expected Behavior**: Strict evaluation order ensures unauthenticated or structurally invalid queries are instantly rejected on the rules layer before hitting relational `get()` queries.

### Vector 11: Malicious OTP Overwrite
*   **Attack**: Attacker updates an active transit package to arbitrary custom passcode values bypassing the delivery code protocol.
*   **Expected Behavior**: `PERMISSION_DENIED`

### Vector 12: Carrier Hijacking / Vehicle Modification
*   **Attack**: Attempting to alter license plates or high-sensitive driver profile credentials from a standard merchant dashboard without proper role authority.
*   **Expected Behavior**: `PERMISSION_DENIED`
