// @group:suite
// @retry=2

describe('Custom-blockbook-discovery', () => {
    beforeEach(() => {
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', {
            needs_backup: true,
            mnemonic: 'all all all all all all all all all all all all',
        });
        cy.task('startBridge');

        cy.viewport(1080, 1440).resetDb();
        cy.prefixedVisit('/settings/coins');
        cy.passThroughInitialRun();
    });

    afterEach(() => {
        cy.task('stopEmu');
    });

    /* Test case
    Will only work on desktop
    1. Go to Crypto Settings
    2. Change BTC backend to custom electrum node
    3. Go to Dashboard
    4. Pass discovery
    5. Assert discovery is success (graph render)
    */
    it('BTC-custom-blockbook-discovery', () => {
        //
        // Test preparation
        //
        const customElectrumNode = 'electrum.corp.sldev.cz:50001:t';

        //
        // Test execution
        //
        cy.getTestElement('@settings/wallet/network/btc', { timeout: 30000 })
            .should('exist')
            .trigger('mouseover');
        cy.getTestElement('@settings/wallet/network/btc/advance').click();
        cy.getTestElement('@modal').should('exist');
        cy.getTestElement('@settings/advance/select-type/input').click();
        cy.getTestElement('@settings/advance/select-type/option/electrum').click();
        cy.getTestElement('@settings/advance/url').type(customElectrumNode);
        cy.getTestElement('@settings/advance/button/save').click();
        cy.getTestElement('@settings/menu/close').click();

        //
        // Assert
        //
        // when graph becomes visible, discovery was finished
        cy.discoveryShouldFinish();
        cy.getTestElement('@dashboard/graph', { timeout: 30000 }).should('exist');
    });
});
