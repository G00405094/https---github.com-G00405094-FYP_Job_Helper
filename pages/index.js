import CVForm from '../components/CV/CVForm';
import Layout from '../components/layout/Layout';

export default function HomePage() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 pt-20">
                <header className="text-center mb-10 ">
                    <h1 className="text-3xl font-bold mb-3 mt-20">AI-Powered CV Generator</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Create a professional CV in minutes with our interactive builder.
                        Select from multiple templates, get smart suggestions based on your job title,
                        and see a live preview as you build.
                    </p>
                </header>
                
                <main>
                    <CVForm />
                </main>
            </div>
        </Layout>
    );
}