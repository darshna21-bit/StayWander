describe('Single Listing Test', () => {

  it('should open listing details page', () => {
    cy.visit('http://localhost:8080/listings');

    // click first listing
    cy.get('.card').first().click();

    // URL should include listing id
    cy.url().should('include', '/listings/');

  });

});