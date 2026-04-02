describe('Login Tests', () => {

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ✅ VALID LOGIN
  it('should login with correct credentials', () => {
    cy.visit('/login');

    cy.get('#username').type('shivani');
    cy.get('#password').type('sdarrr2345');

    cy.get('button[type="submit"]').click();

    // wait for UI update
    cy.wait(1000);

    // ✅ check login success (UI)
    cy.contains('Log out').should('be.visible');
  });

  // ❌ INVALID LOGIN
  it('should not login with wrong password', () => {
    cy.visit('/login');

    cy.get('#username').type('shivani');
    cy.get('#password').type('wrongpassword');

    cy.get('button[type="submit"]').click();

    // ✅ check error message
    cy.contains('Password or username is incorrect').should('be.visible');

    // ✅ ensure user is NOT logged in
    cy.contains('Log out').should('not.exist');
  });

});