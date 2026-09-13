export interface Permission {
  permissionId: number;
  code: string;
  name: string;
  module: string | null;
  description: string | null;
  isActive: boolean;
}