import { GraphQLInt, GraphQLObjectType, GraphQLList as List } from 'graphql';
import ListingType from '../types/ListingType';
import { Listing } from '../models';

const selectionToDict = selections =>
  selections.reduce(
    (obj, selection) => ({
      ...obj,
      [selection.name.value]: selection.selectionSet
        ? selectionToDict(selection.selectionSet.selections)
        : null,
    }),
    {},
  );

const getFieldObj = ast =>
  selectionToDict(ast.fieldNodes[0].selectionSet.selections);

const listings = {
  type: new GraphQLObjectType({
    name: 'ListingResource',
    fields: {
      rows: { type: new List(ListingType) },
      count: { type: GraphQLInt },
    },
  }),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  resolve: async ({ request }, { limit, offset }, root, ast) => {
    const res = await Listing.findAndCountAll({ limit, offset });
    const fields = getFieldObj(ast);
    if ('rows' in fields && 'location' in fields.rows) {
      const promises = res.rows.map(listing => {
        const promise = listing.getLocation();
        promise.then(location => Object.assign(listing, { location }));
        return promise;
      });
      await Promise.all(promises);
    }

    return res;
  },
};

export default listings;
