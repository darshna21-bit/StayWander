describe('Search Test', () => {

  it('should search listings', () => {
    cy.visit('http://localhost:8080/listings');

    cy.get('input[name="q"]').type('mumbai');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', 'q=mumbai');
  });

});