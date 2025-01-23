import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const notify = (message, type = 'success') => {
    toast(message, { type });
};

export default notify;
