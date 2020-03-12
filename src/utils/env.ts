type Environment = 'local' | 'stage' | 'prod';

export default function(graphqlUrl?: string): Environment {
  if (!graphqlUrl || graphqlUrl.includes('stage')) {
    return 'stage';
  }
  if (graphqlUrl.includes('arigato')) {
    return 'local';
  }
  return 'prod';
}
