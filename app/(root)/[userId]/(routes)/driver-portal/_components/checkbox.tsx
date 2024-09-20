import React from 'react';

interface CheckboxProps {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => (
    <input type="checkbox" checked={checked} onChange={onChange} />
);

export default Checkbox;
