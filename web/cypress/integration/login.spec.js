/// <reference types="Cypress" />

// it seems we don't need this since we truthfully log against an API
// Cypress.on('window:before:load', (win) => {
//   win.fetch = null;
// });

context('Test the user login flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('User login fail with wrong credentials', () => {
    it('enters invalid form data for user login', () => {
      cy.get('#email').type('username');
      cy.get('#password').type('password');
      cy.get('form').submit().get('.bottom-right').should('be.visible');
    });
  });

  describe('User login success', () => {
    it('enters valid form data for user login', () => {
      cy.get('#email').type('mlreef');
      cy.get('#password').type('password');
      cy.get('form').submit();
      cy.get('#cy-username').should('match', /\w+/);
    });
  });
});
