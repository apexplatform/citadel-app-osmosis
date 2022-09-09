import { transactions } from './transactions';
import { wallet } from './wallet';
import { auth } from './auth';
import { restake } from './restake';
import { user } from './user';
import { socket } from '../socket/calls';

export const requests = {
    transactions,
    wallet,
    auth,
    restake,
    socket,
    user,
};