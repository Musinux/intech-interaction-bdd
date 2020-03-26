// chai: son rôle est de faire des assertions sur les valeurs retournées par les fonctions
const { expect } = require('chai');
// proxyquire: permet de remplacer des dépendances d'un fichier par des fausses dépendances (proxy de require)
const proxyquire = require('proxyquire');
// sinon: permet de remplacer des fonctions par des "mocks", "stubs" et "spies", qui permettent
// d'investiguer les paramètres avec lesquelles ces fonctions ont été appelées et de simuler
// des valeurs de retour
const sinon = require('sinon');
// sinon-test: permet de faire de l'auto-cleanup sur les spies & co de sinon automatiquement
const test = require('sinon-test')(sinon);

// npm install --global mocha
// npm install -D chai proxyquire sinon sinon-test

const path = '../../controllers/get.module.js';

const Module = {
  getById () { }
};

const ModulePolicy = {
  hasAccessRight () { }
};

const res = {
  status () { return res; },
  send () { },
  json () { }
};

describe('get.module.js', () => {
  it('should call res.json() with the module as an argument when everything is fine', test(async function () {
    // 1) on veut mocker module.model et module.policy
    const controller = proxyquire(path, {
      '../models/module.model.js': Module,
      '../models/policies/module.policy.js': ModulePolicy
    });

    // 2) on veut envoyer des paramètres arbitraires à notre controller
    const req = {
      params: { id: 1 }, // arbitrairement défini à 1
      session: { userId: 3 } // arbitrairement défini à 3
    };
    const fakeModule = {
      id: req.params.id,
      name: 'test module'
    };

    const json = this.spy(res, 'json');
    // 3) on veut contrôler la valeur de retour de ModulePolicy.hasAccessRight
    this.mock(ModulePolicy)
      .expects('hasAccessRight')
      .resolves(true);
    // 4) on veut contrôler la valeur de retour de Module.getById
    this.mock(Module)
      .expects('getById')
      .resolves(fakeModule);

    // 5) appeler le controller avec les bonnes valeurs
    await controller(req, res);
    console.log('fakeModule', fakeModule);
    // 6) on veut vérifier que res.json a été appelé avec une valeur correcte
    expect(json.calledWith(fakeModule)).to.equal(true);
  }));

  it('should call res.status(401) when hasAccessRight returns false', test(async function () {
    // 1) on veut mocker module.model et module.policy
    const controller = proxyquire(path, {
      '../models/module.model.js': Module,
      '../models/policies/module.policy.js': ModulePolicy
    });
    // 2) on veut envoyer des paramètres arbitraires à notre controller
    const req = {
      params: { id: 1 }, // arbitrairement défini à 1
      session: { userId: 3 } // arbitrairement défini à 3
    };

    const status = this.spy(res, 'status');
    // 3) on veut contrôler la valeur de retour de ModulePolicy.hasAccessRight
    this.mock(ModulePolicy)
      .expects('hasAccessRight')
      .resolves(false);

    // 5) appeler le controller avec les bonnes valeurs
    await controller(req, res);
    // 6) on veut vérifier que res.status a été appelé avec une valeur correcte
    expect(status.calledWith(401)).to.equal(true);
  }));
});
