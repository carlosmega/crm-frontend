/**
 * Customer Type Enum (Polimórfico)
 *
 * En Dynamics 365, el campo customerid puede apuntar a:
 * - Account (B2B: empresa/organización)
 * - Contact (B2C: consumidor individual)
 */
export enum CustomerType {
  Account = 'account',
  Contact = 'contact'
}
