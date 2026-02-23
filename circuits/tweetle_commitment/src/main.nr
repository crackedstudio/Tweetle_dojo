use std::hash::poseidon2_permutation;

// Compute the Poseidon2 commitment for a solution word + salt.
// Returns the commitment as a public output.
// This is a helper circuit used only for commitment computation,
// NOT for proof generation (the main tweetle_wordle circuit is used for that).
fn main(solution: [u8; 5], salt: Field) -> pub Field {
    let mut packed: Field = 0;
    for i in 0..5 {
        packed = packed * 256 + solution[i] as Field;
    }
    let input: [Field; 4] = [packed, salt, 0, 0];
    let output = poseidon2_permutation(input, 4);
    output[0]
}

#[test]
fn test_crane_commitment() {
    // "crane" = [99, 114, 97, 110, 101], salt = 1
    let solution: [u8; 5] = [99, 114, 97, 110, 101];
    let commitment = main(solution, 1);
    // This should match the commitment used in tweetle_wordle tests
    std::println(commitment);
}
