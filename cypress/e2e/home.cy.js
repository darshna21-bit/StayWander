describe('StayWander Home Test', () => {
  it('should open homepage', () => {
    cy.visit('http://localhost:8080');

    cy.contains('StayWander'); // or any text visible on homepage
  });
});