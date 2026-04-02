describe('Listings Page Test', () => {

  it('should load listings page', () => {
    cy.visit('http://localhost:8080/listings');

    // check heading or content
    cy.contains('Explore').should('exist'); // navbar text

    // check listing cards exist
    cy.get('.card').should('exist');
  });

});