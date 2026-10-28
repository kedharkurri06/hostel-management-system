const { createServer } = require('vite');

async function testViteDev() {
  const server = await createServer({
    root: 'client',
    server: { port: 5188 }
  });
  await server.listen();
  console.log('Vite dev server started at http://localhost:5188');

  const resIndex = await fetch('http://localhost:5188/');
  const textIndex = await resIndex.text();
  console.log('Index HTML fetched:', textIndex.length);

  const resClient = await fetch('http://localhost:5188/@vite/client');
  const textClient = await resClient.text();
  console.log('@vite/client fetched:', textClient.length);
  console.log('@vite/client has eval:', textClient.includes('eval('));
  console.log('@vite/client has new Function:', textClient.includes('new Function'));
  console.log('@vite/client has Function(:', textClient.includes('Function('));

  const resMain = await fetch('http://localhost:5188/src/main.jsx');
  const textMain = await resMain.text();
  console.log('/src/main.jsx fetched:', textMain.length);
  console.log('/src/main.jsx has eval:', textMain.includes('eval('));

  await server.close();
}

testViteDev().catch(console.error);

