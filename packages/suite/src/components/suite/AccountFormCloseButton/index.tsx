import React from 'react';
import { useActions } from '@suite-hooks';
import * as routerActions from '@suite-actions/routerActions';
import { CloseButton } from '@suite-components';
import { Route } from '@suite-constants/routes';

interface AccountFormCloseButtonProps {
    routeName?: Route['name'];
    onClose?: () => void;
}

export const AccountFormCloseButton = ({
    routeName = 'wallet-index',
    onClose,
}: AccountFormCloseButtonProps) => {
    const { goto } = useActions({
        goto: routerActions.goto,
    });
    return (
        <CloseButton
            onClick={() => {
                goto(routeName, { preserveParams: true });
                if (onClose) {
                    onClose();
                }
            }}
            data-test="@wallet/menu/close-button"
        />
    );
};
