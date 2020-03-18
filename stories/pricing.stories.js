import { storiesOf } from '@storybook/html';
import { withKnobs, text, select } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

const products = {
  'Aiven Cassandra': '234qqazjcy9xm55tf0xner1nrb2tj',
  'Aiven Elasticsearch': '234j2mtuym05gh8far9000mjnt2yw',
  'Aiven Grafana': '234vbqa39t933a05x3ce2ge2pe9nm',
  'Aiven Kafka': '234j1veb58h231cf99mqjmambj37c',
  'Aiven PostgreSQL': '234tmxeupmrt5rx93qx70yar4de1m',
  'Aiven Redis': '234x63nf03qxfrvkexxfk79hrczmp',
  Blitline: '234htwpkzvg1vuyez6uybfhv8rjb2',
  'Bonsai Elasticsearch': '234rrwjuvq3t66r1r0p797p9jvrn2',
  CloudAMQP: '234u3fyxq4pa2kzcu23w77cd9tq4g',
  Cloudcube: '234vpcvg8k7dty17j7wmazfpdbrag',
  'Custom Image Recognition': '234q7ufpnwffnw63ktp1bzeqzxzdy',
  'DB33 MySQL': '234rn4fn1uv6ajn0c804ubqu68e38',
  Dumper: '234gy5mug2rpqcfjq109z6dcqmrgc',
  'Elegant CMS': '234qqzb2wm6gavkvaqr9e6b54j9dg',
  Formspree: '234kj4rh6p36xp07u61qc86w94v2r',
  'Generic Image Tagging': '234hyjj2qbkpyw4z0g0bwgjgtydnj',
  HyPDF: '234n81q2693cee1680fxjkcutw476',
  InfluxDB: '234ku86rd8fmea5peabd7fgzxztxw',
  Informant: '234jgrbpyg8ht242yu6tmq072w6tu',
  IronCache: '234pder46cj32zuj6eh5uhyc8tjxe',
  IronMQ: '234tv2aj7n5vf7zc7hbqzvxeft91e',
  IronWorker: '234we3e052j7aywctt4ut62yxkddj',
  'JawsDB Maria': '234wx0gvvxnqxyukyn6r7xgy9qm6u',
  'JawsDB MySQL': '234w1jyaum5j0aqe3g3bmbqjgf20p',
  'JawsDB PostgreSQL': '234udujapvu1yg2fq019qt02ynf1m',
  LogDNA: '234qkjvrptpy3thna4qttwt7m2nf6',
  Mailgun: '234mauvfd213a0a87q42eb0mmq5ye',
  MemCachier: '234yu3bya4z0t6zwrpvgbfbxrwabp',
  'NodeChef App Container': '234xd3r287f8xvmk3w5gut5kbukvp',
  'NodeChef MongoDB ': '234rqhw3bhjb6zjfff7x8z5b1ct0c',
  'OAuth.io': '234mbngepc31ebkb0dp7j12b7ukjy',
  PDFShift: '234k06n0t66x48t5x1gbb0z3v3d4c',
  Piio: '234vvhkmmpg2mtvr7vqpf1b439y9y',
  Posthook: '234unyrqtdvmyk71qf3cgapdrn9wj',
  'Prefab.cloud': '234j199gnaggg2qj6fvey2m3gw1nc',
  Prometheus: '234pbjjvexny04ft9fn78hf2r9pnj',
  Scaledrone: '234my0gk2vuh2jhtynk2ekpzpvtfm',
  Scout: '234mh3t2j3gk00veubpxbxmzkzgtp',
  SnapShooter: '234mamz0m8h0nz1qe1f1d8h97wey4',
  StatusHub: '234yzpzhu2x4wfc2w8y6x6zv55mam',
  Till: '234jqxdqzjmcr5vu8uhc8dacx3xww',
  'Timber.io Logging': '234yxhkjk8y0c3zjhcxg8brykrnuu',
  Valence: '234kcr16xcekdjjvk0mun98rypeg0',
  Websolr: '234kw73u6y3vdgdpxqhxbr39vxdmj',
  'ZeroSix Cloud Compute Platform': '234nbp17j5zrvb2ym49647kgtyv2a',
  Ziggeo: '234yycr3mf5f2hrw045vuxeatnd50',
};

storiesOf('Manifold Pricing', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .add('manifold-plan-table', () => {
    const catalogProduct = select('Select from Catalog', products, products['JawsDB MySQL']);
    const productId = text('Custom Product ID', ''); // Jaws DB
    const clientId = text('Client ID', '234a33rd2pxfzq9qfk0v5qdrykhcp'); // ziggeo provider id
    const cta = text('cta-text', 'Get Started');
    const baseUrl = text('base-url', '/signup');

    return `<manifold-init client-id="${clientId}"></manifold-init>
    <manifold-plan-table client-id="${clientId}" product-id="${productId ||
      catalogProduct}" base-url="${baseUrl}" cta-text="${cta}"></manifold-plan-table>`;
  });
