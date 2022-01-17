import React from 'react';
import { ThemeProvider as SCThemeProvider, StyleSheetManager } from 'styled-components';
import { useThemeContext } from '@suite-hooks';
import GlobalStyle from './styles/GlobalStyle';

const ThemeProvider: React.FC = ({ children }) => {
    const theme = useThemeContext();

    return (
        <StyleSheetManager disableVendorPrefixes>
            <SCThemeProvider theme={theme}>
                <GlobalStyle theme={theme} />
                {children}
            </SCThemeProvider>
        </StyleSheetManager>
    );
};

export default ThemeProvider;
