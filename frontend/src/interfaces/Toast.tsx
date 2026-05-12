interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default Toast;