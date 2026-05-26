/** Custom Require * */
module.exports = {
  /**
   * Run the database seed
   */
  async up(queryInterface) {
    const organizations = [{
      name: 'iTechnolabs',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'HouzCheck',
      created_at: new Date(),
      updated_at: new Date(),
    }];

    // Clean up existing organizations to avoid duplicate entry errors
    await queryInterface.bulkDelete('organizations', {
      name: organizations.map((o) => o.name),
    }, {});

    await queryInterface.bulkInsert('organizations', organizations, {});
  },

  /**
   * Revert the database seed
   */
  async down(queryInterface) {
    await queryInterface.bulkDelete('organizations', null, {});
  },
};
