// /app/upload/components/UploadForm.js
'use client';
import { UploadServerAction } from './Uploadserveraction';
import { getS3FileListServerAction } from './Uploadserveraction';
import { useState } from 'react';


function UploadForm() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        if (!file) {
            setMessage('لطفاً فایلی را انتخاب کنید.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await UploadServerAction(formData);

            
            if (response.status===200) {
                setMessage('فایل با موفقیت آپلود شد.');
            } else {
                setMessage(`خطا: ${result.error}`);
            }
        } catch (error) {
            setMessage('خطا در آپلود فایل.');
        }
    }; 

    const getlisthandler = async (e) => {
        e.preventDefault();
        const response = await getS3FileListServerAction()

    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button type="submit">آپلود</button>
            
            {message && <p>{message}</p>}
            <button onClick={getlisthandler}>دریافت</button>
        </form>
    );
}
export default UploadForm
