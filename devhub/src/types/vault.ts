export interface VaultEntry {
  vault_id: number
  user_id: string
  user_email: string
  user_name: string
  has_password: boolean
  created_at: string
  access_code_hint: string
}

export interface PasswordDetails {
  user_id: string
  user_email: string
  user_name: string
  original_password: string
  created_at: string
}
