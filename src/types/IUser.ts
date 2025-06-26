export enum UserType {
    CUSTOMER = 'customer',
    RESELLER = 'reseller',
    INTERNAL = 'internal',
}

export enum OrganisationType {
    PUBLIC = 'Public',
    PRIVATE = 'Private',
    OTHER = 'Other',
    INTERNAL = 'internal', //
}

export enum OrganisationStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface Role {
    name: string;
}

export interface Organisation {
    id: string;
    organisation_name: string;
    organisation_type: OrganisationType | string;
    organisation_status: OrganisationStatus | string;
}

export interface UserOrgRole {
    orgId: string;
    organisation: Organisation;
    role: Role;
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
    userType: UserType;
    isVerified: boolean;
    isFirstLogin: boolean;
    createdAt: string;
    updatedAt: string;
    roles: UserOrgRole[];
}
