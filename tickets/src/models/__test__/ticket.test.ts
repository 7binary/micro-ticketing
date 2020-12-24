import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  const ticket = Ticket.build({
    title: 'Any',
    price: 10,
    userId: 'asdf123',
  });
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 11 });
  secondInstance!.set({ price: 12 });

  await firstInstance!.save();

  await expect(async () => await secondInstance!.save())
    .rejects
    .toThrow('No matching document found');
});

it('updates version on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'Any',
    price: 10,
    userId: 'asdf',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
