import { gql } from '@apollo/client';

export const QUERY_ME = gql`
    query me{
        me{
            _id
            username
            email
            books {
                authors
                description
                _id
                image
                link
                title
            }
        }
    }
`;