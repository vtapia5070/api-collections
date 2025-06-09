import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cats = [
  {
    name: 'Luna',
    age: 3,
    breed: 'Persian',
    imageUrl:
      'https://images.pexels.com/photos/1644767/pexels-photo-1644767.jpeg',
  },
  {
    name: 'Oliver',
    age: 2,
    breed: 'Siamese',
    imageUrl:
      'https://images.pexels.com/photos/357141/pexels-photo-357141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    name: 'Milo',
    age: 1,
    breed: 'Maine Coon',
  },
  {
    name: 'Bella',
    breed: 'Ragdoll',
    imageUrl:
      'https://images.pexels.com/photos/208773/pexels-photo-208773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.cat.deleteMany();

  for (const cat of cats) {
    const createdCat = await prisma.cat.create({
      data: cat,
    });
    console.log(`Created cat with id: ${createdCat.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
