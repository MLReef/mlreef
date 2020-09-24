/// <reference types="Cypress" />
import uuid from 'uuid/v1';

context('Test the project creation flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login();
  });

  // User creates a succesful data project
  describe('Assert that project UI works perfectly', () => {
    it('Successful project creation', () => {
      cy.get('[data-cy=project-create-btn]').click();
      cy.get('[data-cy=project-name]').type(`Cypress Test ${uuid()}`);
      cy.get('[data-cy=namespace-select]').select('mlreef');
      cy.get('[data-cy=description]').type('Entering a basic description');
      cy.get('[data-cy=TEXT]').click();
      cy.get('[data-cy=IMAGE]').click();
      cy.get('[data-cy=AUDIO]').click();
      cy.get('[data-cy=MODEL]').click();
      cy.get('[data-cy=read-me-checkbox]').click();
      cy.get('[data-cy=create-btn]').click();
      cy.delete();
    });

    // User is displayed error messages when he enters wrong information
    it('Invalid project name', () => {
      cy.get('[data-cy=project-create-btn]').click();
      cy.get('[data-cy=project-name]').type('Sign Language Classifier');
      cy.get('[data-cy=project-name]', {timeout: 1000}).blur();
      cy.wait(5000).get('[data-cy=m-error]').should('have.text', 'Conflicting: Project name is already used by you or in your teams');
      cy.get('#projectTitle').clear();
      cy.get('[data-cy=project-name]').type('Sign@Name!$');
      cy.get('[data-cy=m-error]', { timeout: 2000 }).should(
        'have.text',
        'Name can only contain letters, digits, "_", ".", dashes or spaces. It must start with a letter, digit or "_".',
      );
    });
  });
});
