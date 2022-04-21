// @group:suite
// @retry=2

//steps:
// seeded trezor
// 1 navigate to settings
// 2 scroll down to Experimental features
// log version you are using right now
   
describe('early-access', function () {
    beforeEach(function() {
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', { passphrase_protection: true });
        cy.task('startBridge');

    
        cy.task('applySettings', { passphrase_always_on_device: false });

        cy.viewport(1080, 1440).resetDb();
        cy.prefixedVisit('/');
        cy.passThroughInitialRun();
    });

    it('early access', function () {
        const passphraseToType = 'taxation is theft{enter}';


        cy.getTestElement('@passphrase/input', { timeout: 10000 }).type(passphraseToType);

        cy.task('pressYes');
        cy.task('pressYes');

        cy.getTestElement('@passphrase/input', { timeout: 12000 }).type(passphraseToType);
        cy.getTestElement('@passphrase/confirm-checkbox').click();
        cy.getTestElement('@passphrase/hidden/submit-button').click();

        cy.task('pressYes');
        cy.task('pressYes');
        
        cy.getTestElement('@dashboard/loading', { timeout: 30000 });
        cy.getTestElement('@dashboard/loading', { timeout: 30000 }).should('not.exist');
        

        cy.getTestElement('@suite/menu/settings').click();
        cy.getTestElement('@settings/version').should('exist');
       
        
        cy.get('a[href="https://github.com/trezor/trezor-suite/releases/tag/v22.5.0"]')
        .invoke('text')
        .then( function (readText) {
            cy.log(readText)
        })
    });
});
