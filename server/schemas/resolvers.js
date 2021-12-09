const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.User) {
                return User.findOne({ _id: context.user._id }).populate('savedBooks');
            }
            throw new AuthenticationError('You must be logged in to view your saved books!')
        },
    },

    Mutation: {
        createUser: async (parent, args, context) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { user, token };
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
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBook: args.input }},
                    { new: true }
                );
                return user;
            }
            throw new AuthenticationError('You must be logged in!')
        },
        deleteBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBook: { bookId }}},
                    { new: true }
                );
                return user;
            }
            throw new AuthenticationError('You must be logged in!')
        }
    }
};

module.exports = resolvers;
