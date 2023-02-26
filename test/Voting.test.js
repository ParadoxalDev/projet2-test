const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("Voting", (accounts) => {
  const _owner = accounts[0];
  const _voter1 = accounts[1];
  const _voter2 = accounts[2];
  const _voter3 = accounts[3];

  let votingInstance;

  describe("----- tester les ajouts de voter -----", () => {
    beforeEach(async function () {
      votingInstance = await Voting.new({ from: _owner });
    });

    it("Set the right status", async function () {
      expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(
        new BN(0)
      );
    });
    it("Shoud add a voter", async function () {
      await expect(
        votingInstance.addVoter(_voter1, { from: _owner }),
        "Authorized"
      );
    });
    it("Shoud NOT add a voter", async function () {
      await expectRevert(
        votingInstance.addVoter(_voter1, { from: _voter1 }),
        "Ownable: caller is not the owner"
      );
    });
    it("Shoud NOT add a voter twice", async () => {
      await votingInstance.addVoter(_voter1, { from: _owner });
      await expectRevert.unspecified(
        votingInstance.addVoter(_voter1, { from: _owner }),
        "Already declared!"
      );
    });
    it("Shoud NOT allow voter to be added after proposalsRegistrationStarted", async () => {
      await votingInstance.startProposalsRegistering();
      await expectRevert(
        votingInstance.addVoter(_voter2),
        "Voters registration is not open yet"
      );
    });
  });
  describe("----- Vérifier les propositions -----", () => {
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: _owner });
      await votingInstance.addVoter(_voter1, { from: _owner });
      await votingInstance.addVoter(_voter2, { from: _owner });
    });

    it("Ne peut pas ajouter une propositions tant que l'ajout de voter n'est pas fini!", async () => {
      await expectRevert(
        votingInstance.addProposal("proposition 1", { from: _voter1 }),
        "Proposals are not allowed yet"
      );
    });

    it("Ajouter une proposition", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("proposition 1", { from: _voter1 });
      const proposal = await votingInstance.getOneProposal(new BN(1), {
        from: _voter2,
      });
      expect(proposal.description).to.equal("proposition 1");
      expect(proposal.voteCount).to.be.bignumber.equal(new BN(0));
    });
    it("Ne peut PAS Ajouter une proposition VIDE", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await expectRevert(
        votingInstance.addProposal("", { from: _voter1 }),
        "Vous ne pouvez pas ne rien proposer"
      );
    });

    it("Peut connaitre les propositions si voter", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("proposition 1", { from: _voter1 });
      const proposal = await votingInstance.getOneProposal(new BN(1), {
        from: _voter2,
      });
      expect(proposal.description).to.equal("proposition 1");
    });

    it("Ne peut pas connaitre les propositions si non voter", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("proposition 1", { from: _voter1 });
      await expectRevert(
        votingInstance.getOneProposal(new BN(1), { from: _voter3 }),
        "You're not a voter"
      );
    });
    it("Ne peut PAS Ajouter une proposition si non voter", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await expectRevert(
        votingInstance.addProposal("proposition 1", { from: _voter3 }),
        "You're not a voter"
      );
    });
  });

  describe("------ Vérifier le fonctionnement des votes ------", () => {
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: _owner });
      await votingInstance.addVoter(_voter1, { from: _owner });
      await votingInstance.addVoter(_voter2, { from: _owner });
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("prop 1", { from: _voter1 });
      await votingInstance.addProposal("prop 2", { from: _voter2 });
    });

    it("Ne peut PAS voter pour une proposition existante tant que la phase proposition n'est pas cloturé!", async () => {
      await expectRevert.unspecified(
        votingInstance.setVote(new BN(0), { from: _voter1 }),
        "Registering proposals phase is not finished"
      );
    });
    it("peut voter pour une proposition existante", async () => {
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await votingInstance.setVote(new BN(0), { from: _voter1 });
      const proposal = await votingInstance.getOneProposal(new BN(0), {
        from: _voter2,
      });
      expect(proposal.voteCount).to.be.bignumber.equal(new BN(1));
    });
    it("Ne peut PAS voter deux fois", async () => {
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await votingInstance.setVote(new BN(0), { from: _voter1 });
      await expectRevert(
        votingInstance.setVote(new BN(0), { from: _voter1 }),
        "You have already voted"
      );
    });
    it("Ne peut PAS voter si non voter!", async () => {
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await expectRevert(
        votingInstance.setVote(new BN(0), { from: _voter3 }),
        "You're not a voter"
      );
    });
    it("Ne peut PAS voter pour une proposition NON existante!", async () => {
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await expectRevert(
        votingInstance.setVote(new BN(3), { from: _voter1 }),
        "Proposal not found"
      );
    });
  });
  describe("------ Verifier les ETATS ------", () => {
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: _owner });
      await votingInstance.addVoter(_voter1, { from: _owner });
      await votingInstance.addVoter(_voter2, { from: _owner });
    });
    it("Ne peut pas ajouter de proposition si pas ouvert", async () => {
      await expectRevert.unspecified(
        votingInstance.addProposal("test", { from: _voter1 })
      );
    });

    it("Peut ajouter une proposition si ouvert et voter", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await expect(votingInstance.addProposal("test", { from: _voter1 }));
    });

    it("Ne peut pas ajouter de voter si proposition ouverte", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await expectRevert.unspecified(
        votingInstance.addVoter(_voter3, { from: _owner })
      );
    });
    it("Ne peut pas voter si proposition ouverte", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await expectRevert.unspecified(
        votingInstance.setVote(new BN(1), { from: _voter1 })
      );
    });
    it("Ne peut pas voter si vote pas ouvert", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("proposition 1", { from: _voter1 });
      await votingInstance.endProposalsRegistering();
      await expectRevert.unspecified(
        votingInstance.setVote(new BN(1), { from: _voter1 })
      );
    });
    it("Peut voter si proposition fermée", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("proposition 1", { from: _voter1 });
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      expect(votingInstance.setVote(new BN(1), { from: _voter1 }));
    });
    it("Ne Peut PAS voter si vote fermé", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("proposition 1", { from: _voter1 });
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await votingInstance.endVotingSession();
      await expectRevert.unspecified(
        votingInstance.setVote(new BN(1), { from: _voter1 })
      );
    });
    it("Ne Peut PAS connaitre le gagnant si vote PAS fermé", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("proposition 1", { from: _voter1 });
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await expectRevert.unspecified(
        votingInstance.tallyVotes(),
        "Vote pas cloturé!"
      );
    });
    it("Peut connaitre le gagnant si vote cloturé", async () => {
      await votingInstance.startProposalsRegistering({ from: _owner });
      await votingInstance.addProposal("proposition 1", { from: _voter1 });
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await votingInstance.endVotingSession();
      expect(votingInstance.tallyVotes());
    });
  });
  describe("------ Verifier les EVENTS ------", () => {
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: _owner });
      /* await votingInstance.addVoter(_voter1, { from: _owner });
      await votingInstance.addVoter(_voter2, { from: _owner });*/
    });
    it("doit émettre un event à l'ajout de voter", async () => {
      const receipt = await votingInstance.addVoter(_voter1, { from: _owner });
      await expectEvent(receipt, "VoterRegistered", { voterAddress: _voter1 });
    });
    it("doit émettre un event à l'ajout de proposition & changement de status", async () => {
      await votingInstance.addVoter(_voter1, { from: _owner });
      const expectedPreviousStatus = new BN(0);
      const expectedNewStatus = new BN(1);
      const receipt = await votingInstance.startProposalsRegistering({
        from: _owner,
      });
      expectEvent(receipt, "WorkflowStatusChange", {
        previousStatus: expectedPreviousStatus,
        newStatus: expectedNewStatus,
      });
      const receipt2 = await votingInstance.addProposal("test", {
        from: _voter1,
      });
      const proposal = votingInstance.proposalsArray;
      await expectEvent(receipt2, "ProposalRegistered", {
        proposalId: new BN(1),
      });
    });
    it("doit émettre un event au vote et changement de statut", async () => {
      await votingInstance.addVoter(_voter1, { from: _owner });
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal("test", {
        from: _voter1,
      });
      const expectedPreviousStatus = new BN(1);
      const expectedNewStatus = new BN(2);
      const receipt = await votingInstance.endProposalsRegistering({
        from: _owner,
      });
      expectEvent(receipt, "WorkflowStatusChange", {
        previousStatus: expectedPreviousStatus,
        newStatus: expectedNewStatus,
      });
      const expectedPreviousStatus2 = new BN(2);
      const expectedNewStatus2 = new BN(3);
      const receipt2 = await votingInstance.startVotingSession({
        from: _owner,
      });
      expectEvent(receipt2, "WorkflowStatusChange", {
        previousStatus: expectedPreviousStatus2,
        newStatus: expectedNewStatus2,
      });
      const receipt3 = await votingInstance.setVote(new BN(1), {
        from: _voter1,
      });
      await expectEvent(
        receipt3,
        "Voted",
        { voter: _voter1 },
        {
          proposalId: new BN(1),
        }
      );
    });
    it("doit émettre un event au changement à la cloture de la session de vote", async () => {
      await votingInstance.addVoter(_voter1, { from: _owner });
      await votingInstance.startProposalsRegistering();
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      const expectedPreviousStatus = new BN(3);
      const expectedNewStatus = new BN(4);
      const receipt = await votingInstance.endVotingSession();
      expectEvent(receipt, "WorkflowStatusChange", {
        previousStatus: expectedPreviousStatus,
        newStatus: expectedNewStatus,
      });
    });
    it("doit émettre un event à la révélation du gagnant", async () => {
      await votingInstance.addVoter(_voter1, { from: _owner });
      await votingInstance.startProposalsRegistering();
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await votingInstance.endVotingSession();
      const expectedPreviousStatus = new BN(4);
      const expectedNewStatus = new BN(5);
      const receipt = await votingInstance.tallyVotes();
      expectEvent(receipt, "WorkflowStatusChange", {
        previousStatus: expectedPreviousStatus,
        newStatus: expectedNewStatus,
      });
    });
  });
});
