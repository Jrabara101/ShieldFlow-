#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Bytes, Env, Symbol, Address, Error};

const ADMIN: Symbol = symbol_short!("admin");

#[contract]
pub struct ComplianceVerifier;

#[contractimpl]
impl ComplianceVerifier {
    pub fn init(env: Env, admin: Address) -> Result<(), Error> {
        let storage = env.storage().persistent();

        if storage.has(&ADMIN) {
            return Err(Error::from_contract_error(1));
        }

        storage.set(&ADMIN, &admin);
        Ok(())
    }

    pub fn verify_kyc(
        env: Env,
        recipient_did: Bytes,
        recipient_commit: Bytes,
    ) -> Result<bool, Error> {
        if recipient_did.is_empty() || recipient_commit.is_empty() {
            return Err(Error::from_contract_error(2));
        }

        env.events().publish(
            (symbol_short!("verify"),),
            (recipient_did, recipient_commit),
        );

        Ok(true)
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        let storage = env.storage().persistent();
        storage.get(&ADMIN)
            .ok_or(Error::from_contract_error(3))
            .map(|v| v)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_kyc_verification() {
    }
}
