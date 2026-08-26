import Swal from 'sweetalert2';

// Corporate styling for PT DSLNG alerts
const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-slate-200 font-sans text-slate-800',
    title: 'text-lg font-bold text-slate-900 tracking-tight',
    htmlContainer: 'text-sm text-slate-600 leading-relaxed',
    confirmButton: 'px-5 py-2.5 bg-[#004380] hover:bg-[#003366] text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-[#004380]',
    cancelButton: 'px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg ml-3 transition-all',
  },
  buttonsStyling: false,
});

export const notifySuccess = (message: string, title: string = 'Berhasil') => {
  return customSwal.fire({
    icon: 'success',
    title,
    text: message,
    iconColor: '#00A3E0',
    confirmButtonText: 'OK, Mengerti',
    timer: 4500,
    timerProgressBar: true,
  });
};

export const notifyError = (message: string, title: string = 'Gagal / Perhatian') => {
  return customSwal.fire({
    icon: 'error',
    title,
    text: message,
    iconColor: '#EF4444',
    confirmButtonText: 'Tutup',
  });
};

export const notifyConfirm = async (
  title: string,
  text: string,
  confirmButtonText: string = 'Ya, Lanjutkan',
  cancelButtonText: string = 'Batal'
): Promise<boolean> => {
  const result = await customSwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    iconColor: '#F59E0B',
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const notifyToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    customClass: {
      popup: 'rounded-xl shadow-lg border border-slate-200 bg-white font-sans text-sm',
    },
  });

  Toast.fire({
    icon: type,
    title: message,
  });
};
