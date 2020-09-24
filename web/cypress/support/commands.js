// Any reuable functions/helpers for the tests should be added in commands.js

// The user login command which can used before starting any test suite
Cypress.Commands.add('login', () => {
  cy.get('#email').type('mlreef');
  cy.get('#password').type('password');
  cy.get('form').submit();
  cy.get('#cy-username').should('match', /\w+/);
});

// The project deletion command to delete a created project
// without leaving residue.
// Use this command when you are inside a project
Cypress.Commands.add('delete', () => {
  cy.wait(10000).get('#settings').click();
  cy.get('[data-cy=project-name]')
    .invoke('val')
    .then((res) => {
      cy.get('[data-cy=advanced-accordion]').click();
      cy.get('[data-cy=project-delete-btn]').click();
      cy.get('[data-cy=project-name-input]').type(res);
      cy.get('[data-cy=remove-project]').click();
    });
});
