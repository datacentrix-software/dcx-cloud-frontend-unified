export enum UserType {
    CUSTOMER = 'customer',
    RESELLER = 'reseller',
    INTERNAL = 'internal',
}

export enum OrganisationType {
    PUBLIC = 'Public',
    PRIVATE = 'Private',
    OTHER = 'Other',
}

export interface Role {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface Organisation {
    id: string;
    organisation_name: string;
    org_description: string | null;
    organisation_type: OrganisationType | string;
}

export interface UserRole {
    role: Role;
}

export interface UserOrganisation {
    organisation: Organisation;
}

export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    address: string;
    province: string;
    city: string;
    postalCode: string;
    user_type: UserType;
    isVerified: boolean;
    isFirstLogin: boolean;
    createdAt: string;
    updatedAt: string;
    userRoles: UserRole[];
    userOrganisations: UserOrganisation[];
}
