import { createAction } from '@reduxjs/toolkit';

import { NetworkSymbol } from '@suite-common/wallet-config';

const actionsPrefix = '@common/token-definitions';

const fetchSuccess = createAction<{
    networkSymbol: NetworkSymbol;
    contractAddress: string;
    tokenDefinition: ArrayBuffer | undefined;
}>(`${actionsPrefix}/fetchSuccess`);

const fetchInit = createAction<{ networkSymbol: NetworkSymbol; contractAddress: string }>(
    `${actionsPrefix}/fetchInit`,
);

const fetchError = createAction<{
    networkSymbol: NetworkSymbol;
    contractAddress: string;
}>(`${actionsPrefix}/fetchError`);

export const tokenDefinitionsActions = {
    actionsPrefix,
    fetchSuccess,
    fetchInit,
    fetchError,
};
