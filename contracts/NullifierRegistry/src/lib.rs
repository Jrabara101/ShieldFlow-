#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Bytes, Env, Symbol, Address, Error};

const ADMIN: Symbol = symbol_short!("admin");
const NULLIFIERS: Symbol = symbol_short!("nulf");

#[contract]
pub struct NullifierRegistry;

#[contractimpl]
impl NullifierRegistry {
    pub fn init(env: Env, admin: Address) -> Result<(), Error> {
        let storage = env.storage().persistent();

        if storage.has(&ADMIN) {
            return Err(Error::from_contract_error(1));
        }

        storage.set(&ADMIN, &admin);
        Ok(())
    }

    pub fn insert_nullifier(env: Env, nullifier: Bytes) -> Result<(), Error> {
        let storage = env.storage().persistent();

        if storage.has(&nullifier) {
            return Err(Error::from_contract_error(2));
        }

        let block_height = env.ledger().sequence();
        storage.set(&nullifier, &block_height);

        env.events().publish(
            (symbol_short!("insert"),),
            nullifier,
        );

        Ok(())
    }

    pub fn is_spent(env: Env, nullifier: Bytes) -> Result<bool, Error> {
        let storage = env.storage().persistent();
        Ok(storage.has(&nullifier))
    }

    pub fn prune(env: Env, blocks_to_keep: u32) -> Result<(), Error> {
        let current_block = env.ledger().sequence();
        let cutoff_block = current_block.saturating_sub(blocks_to_keep);

        env.events().publish(
            (symbol_short!("prune"),),
            cutoff_block,
        );

        Ok(())
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
    fn test_nullifier_insertion() {
    }

    #[test]
    fn test_replay_prevention() {
    }
}
