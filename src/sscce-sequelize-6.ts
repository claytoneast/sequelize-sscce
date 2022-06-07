import { DataTypes, Model } from 'sequelize';
import { createSequelize6Instance } from '../setup/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class Foo extends Model {}

  Foo.init({
    name: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Foo',
  });

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync({ force: true });
  expect(spy).to.have.been.called;

  console.log(await Foo.create({ name: 'TS foo' }));
  expect(await Foo.count()).to.equal(1);

  // One dollar sign: totally cool
  const foo1Name = "$666";
  await Foo.create({
    name: sequelize.fn("substr", foo1Name, "0"),
  });
  const foundFoo1 = await Foo.findAll({ where: { name: foo1Name } });
  expect(foundFoo1.length).to.equal(1);

  // Two dollar signs in the same "word", totally cool
  const foo2Name = "$666$420"; // note: not space separated.
  await Foo.create({
    name: sequelize.fn("substr", foo2Name, "0"),
  });

  const foundFoo2 = await Foo.findAll({ where: { name: foo2Name } });
  expect(foundFoo2.length).to.equal(1);

  // Two dollar signs in separate words: totally NOT cool
  const foo3Name = "$$666 $420"; // note: two dollar signs WITH space-separation
  await Foo.create({
    name: sequelize.fn("substr", foo3Name, "0"),
  });

  const foundFoo3 = await Foo.findAll({ where: { name: foo3Name } });
  expect(foundFoo3.length).to.equal(1); // test fails because it blew up above
}
