import React from 'react';

export interface BaseAuthType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

export interface registerType extends BaseAuthType {}
export interface loginType extends BaseAuthType {}
export interface signInType {
  title?: string;
}
