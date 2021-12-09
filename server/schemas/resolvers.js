const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.User) {
                return User.findOne({ _id: context.user._id }).populate('books');
            }
            throw new AuthenticationError('You must be logged in to view your saved books!')
        },
    },

    Mutations: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user};
        },
        login: async( parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect login credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError('Incorrect login credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        addBook: async (parent, { book }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { books: book}},
                    {new: true }
                );
                return user;
            }
            throw new AuthenticationError('You must be logged in!')
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { books: { bookId }}},
                    { new: true }
                );
                return user;
            }
            throw new AuthenticationError('You must be logged in!')
        }
    }
};

module.exports = resolvers;
