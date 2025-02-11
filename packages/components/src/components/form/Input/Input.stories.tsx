import { ChangeEvent } from 'react';
import { useArgs } from '@storybook/client-api';

import { Input as InputComponent } from './Input';

export default {
    title: 'Form/Input',
    args: {
        value: 'Input',
        label: 'Label',
        bottomText: '',
        placeholder: '',
        isDisabled: false,
        isMonospace: false,
        inputState: null,
        variant: null,
    },
    argTypes: {
        state: {
            control: {
                options: {
                    'None (default)': null,
                    Success: 'success',
                    Warning: 'warning',
                    Error: 'error',
                },
                type: 'radio',
            },
        },
        variant: {
            control: {
                options: { 'Large (default)': null, Small: 'small' },
                type: 'radio',
            },
        },
    },
};

export const Input = {
    render: ({ ...args }) => {
        // eslint-disable-next-line
        const [{ value }, updateArgs] = useArgs();
        const handleValue = (e: ChangeEvent<HTMLInputElement>) => {
            updateArgs({ value: e.target.value });
        };

        return (
            <InputComponent
                isDisabled={args.isDisabled}
                inputState={args.state}
                variant={args.variant}
                label={args.label}
                bottomText={args.bottomText}
                placeholder={args.placeholder}
                isMonospace={args.isMonospace}
                value={value}
                onChange={handleValue}
            />
        );
    },
};
