import Review from '../Review';

describe('Review entity', () => {
  test('create valid review and toJSON contains expected fields', () => {
    const r = Review.create({
      authorId: 'u1',
      targetId: 't1',
      rentalId: 'rent1',
      rating: 5,
      title: 'Super',
      content: 'Très bon outil, conforme à la description.',
      isVerifiedRental: false,
    });
    const json = r.toJSON();
    expect(json.rating).toBe(5);
    expect(json.title).toBe('Super');
    expect(json.hasResponse).toBe(false);
    expect(typeof json.score).toBe('number');
  });

  test('rejects invalid rating on create', () => {
    expect(() => Review.create({
      authorId: 'u1', targetId: 't1', rentalId: 'r1', rating: 6
    })).toThrow(/Rating/);
  });

  test('update title/content/rating within allowed timeframe', () => {
    const r = Review.create({
      authorId: 'a1', targetId: 't1', rentalId: 'r1', rating: 4, content: 'Original content'
    });
    const updated = r.update({ title: 'Nouveau', content: 'Contenu mis à jour', rating: 5 });
    expect(updated).toBe(true);
    expect(r.title).toBe('Nouveau');
    expect(r.rating).toBe(5);
    expect(r.metadata.editCount).toBe(1);
  });

  test('cannot update if outside edit window (simulate old creation date)', () => {
    const oldCreated = new Date(Date.now() - (48 * 60 * 60 * 1000)); // 48 hours ago
    const r = new Review({
      id: 'x1',
      authorId: 'a', targetId: 't', rentalId: 'rl', rating: 3,
      createdAt: oldCreated,
      updatedAt: oldCreated
    });
    expect(() => r.update({ content: 'x' })).toThrow(/24 hours/);
  });

  test('add and edit response within allowed time', () => {
    const r = Review.create({
      authorId: 'a2', targetId: 't2', rentalId: 'r2', rating: 4
    });
    r.addResponse('Merci pour votre retour');
    expect(r.hasResponse()).toBe(true);
    expect(r.response).toBe('Merci pour votre retour');
    // edit response immediately
    r.editResponse('Nouvelle réponse');
    expect(r.response).toBe('Nouvelle réponse');
    expect(r.metadata.responseEditCount).toBe(1);
  });

  test('markAsHelpful increments and auto-verify after threshold', () => {
    const r = Review.create({
      authorId: 'a3', targetId: 't3', rentalId: 'r3', rating: 5
    });
    for (let i = 0; i < 10; i++) {
      r.markAsHelpful();
    }
    expect(r.helpfulCount).toBe(10);
    expect(r.metadata.autoVerified).toBe(true);
    expect(r.metadata.autoVerifiedAt).toBeDefined();
  });

  test('report increments and auto-hides after threshold', () => {
    const r = Review.create({
      authorId: 'a4', targetId: 't4', rentalId: 'r4', rating: 2
    });
    for (let i = 0; i < 5; i++) {
      r.report(`reason ${i+1}`);
    }
    expect(r.reportCount).toBe(5);
    expect(r.isHidden).toBe(true);
    expect(r.hiddenReason).toMatch(/Auto-hidden/);
  });

  test('calculateScore returns value within 0-100', () => {
    const r = Review.create({
      authorId: 'a5', targetId: 't5', rentalId: 'r5', rating: 3,
      content: 'Sufficient content to bump score a bit'
    });
    const score = r.calculateScore();
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
