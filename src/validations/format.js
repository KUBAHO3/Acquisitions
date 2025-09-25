export const formatValidationError = (errors) => {
    if (!errors || !errors.issues) return 'Validarion Failed';

    if (Array.isArray(errors.issues)) return errors.issues.map(issue => issue.message).join(', ');

    return JSON.stringify(errors);
};