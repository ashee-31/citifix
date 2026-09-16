// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CivicProofRegistry
 * @notice On-chain registry for complaint proof hashes.
 *
 * Stores a canonical record hash + metadata URI for each complaint,
 * enabling tamper detection. No PII is ever stored on-chain —
 * only the complaint ID, record hash, timestamp, and data URI.
 */
contract CivicProofRegistry {
  struct Proof {
    bytes32 recordHash;
    uint256 timestamp;
    string  dataUri;
    address anchoredBy;
    bool    exists;
  }

  // complaintId => Proof
  mapping(string => Proof) public proofs;

  event ProofAnchored(
    string indexed complaintId,
    bytes32 indexed recordHash,
    uint256 timestamp,
    address anchoredBy
  );

  event ProofVerified(
    string indexed complaintId,
    bool valid
  );

  /**
   * @notice Anchor a record hash for a complaint.
   * @param complaintId The CP-YYYY-NNNN identifier.
   * @param recordHash  The SHA-256 hash of the canonical complaint record.
   * @param dataUri     Off-chain data reference (IPFS URI, HTTP URL, etc.).
   */
  function anchorProof(
    string calldata complaintId,
    bytes32 recordHash,
    string calldata dataUri
  ) external {
    require(!proofs[complaintId].exists, "Proof already anchored");
    require(bytes(complaintId).length > 0, "Empty complaint ID");
    require(recordHash != bytes32(0), "Empty record hash");

    proofs[complaintId] = Proof({
      recordHash: recordHash,
      timestamp:  block.timestamp,
      dataUri:    dataUri,
      anchoredBy: msg.sender,
      exists:     true
    });

    emit ProofAnchored(complaintId, recordHash, block.timestamp, msg.sender);
  }

  /**
   * @notice Verify a complaint's record hash matches the anchored value.
   * @param complaintId The CP-YYYY-NNNN identifier.
   * @param recordHash  The hash to verify against.
   * @return valid True if the hashes match.
   */
  function verifyProof(
    string calldata complaintId,
    bytes32 recordHash
  ) external view returns (bool valid) {
    Proof storage p = proofs[complaintId];
    if (!p.exists) return false;
    return p.recordHash == recordHash;
  }

  /**
   * @notice Get full proof details for a complaint.
   * @param complaintId The CP-YYYY-NNNN identifier.
   */
  function getProof(string calldata complaintId)
    external
    view
    returns (
      bytes32 recordHash,
      uint256 timestamp,
      string  memory dataUri,
      address anchoredBy,
      bool    exists
    )
  {
    Proof storage p = proofs[complaintId];
    return (p.recordHash, p.timestamp, p.dataUri, p.anchoredBy, p.exists);
  }
}
