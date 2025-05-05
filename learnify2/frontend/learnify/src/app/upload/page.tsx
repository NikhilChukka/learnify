"use client";
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function KeyConceptCard({ concept, description, file }: { concept: string; description: string; file: File | null }) {
    const router = useRouter();
    const [hover, setHover] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [loadingFlashcards, setLoadingFlashcards] = useState(false);
    const [details, setDetails] = useState<string | null>(null);
    const [quizzes, setQuizzes] = useState<{ question: string; answer: string }[] | null>(null);
    const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[] | null>(null);

    const fetchDetails = async () => {
        if (!file) {
            alert("No file uploaded. Please upload a file first.");
            return;
        }
        setLoadingDetails(true);
        const formData = new FormData();
        formData.append("pdf_file", file);
        formData.append("concept", concept);
        try {
            const res = await axios.post("http://127.0.0.1:8000/content/get_key_concept_details", formData);
            router.push(`/concept?param=${encodeURIComponent(res.data.concept)}`);
            setDetails(res.data.details);
        } catch (error) {
            console.error("Error fetching concept details:", error);
            alert("Failed to fetch details for the concept.");
        } finally {
            setLoadingDetails(false);
        }
    };

    const fetchQuizzes = async () => {
        if (!file) {
            alert("No file uploaded. Please upload a file first.");
            return;
        }
        setLoadingQuizzes(true);
        const formData = new FormData();
        formData.append("pdf_file", file);
        formData.append("concept", concept);
        try {
            const res = await axios.post("http://127.0.0.1:8000/content/generate_quizzes", formData);
            setQuizzes(res.data.quizzes);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            alert("Failed to fetch quizzes for the concept.");
        } finally {
            setLoadingQuizzes(false);
        }
    };

    const fetchFlashcards = async () => {
        if (!file) {
            alert("No file uploaded. Please upload a file first.");
            return;
        }
        setLoadingFlashcards(true);
        const formData = new FormData();
        formData.append("pdf_file", file);
        formData.append("concept", concept);
        try {
            const res = await axios.post("http://127.0.0.1:8000/content/generate_flashcards", formData);
            setFlashcards(res.data.flashcards);
        } catch (error) {
            console.error("Error fetching flashcards:", error);
            alert("Failed to fetch flashcards for the concept.");
        } finally {
            setLoadingFlashcards(false);
        }
    };

    return (
        <div
            className={`relative flex flex-col justify-between h-full p-4 rounded-lg transition-transform duration-200 bg-white dark:bg-gray-900 ${
                hover ? "scale-105 shadow-lg z-10" : ""
            }`}
            style={{ minHeight: "100px", wordBreak: "break-word" }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{concept}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            {hover && (
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button
                        onClick={fetchDetails}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                        {loadingDetails ? "Loading..." : "See Details"}
                    </button>
                    <button
                        onClick={fetchQuizzes}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                        {loadingQuizzes ? "Loading..." : "Generate Quizzes"}
                    </button>
                    <button
                        onClick={fetchFlashcards}
                        className="bg-purple-500 text-white px-2 py-1 rounded"
                    >
                        {loadingFlashcards ? "Loading..." : "Generate Flashcards"}
                    </button>
                </div>
            )}
            {details && (
                <div className="mt-4 p-2 border-t border-gray-300 dark:border-gray-700">
                    <h3 className="text-md font-semibold">Details:</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{details}</p>
                </div>
            )}
            {quizzes && (
                <div className="mt-4 p-2 border-t border-gray-300 dark:border-gray-700">
                    <h3 className="text-md font-semibold">Quizzes:</h3>
                    <ul className="list-disc pl-5">
                        {quizzes.map((quiz, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Q:</strong> {quiz.question} <br />
                                <strong>A:</strong> {quiz.answer}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {flashcards && (
                <div className="mt-4 p-2 border-t border-gray-300 dark:border-gray-700">
                    <h3 className="text-md font-semibold">Flashcards:</h3>
                    <ul className="list-disc pl-5">
                        {flashcards.map((flashcard, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Q:</strong> {flashcard.question} <br />
                                <strong>A:</strong> {flashcard.answer}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function QuizCard({ question, options }: { question: string; options: string[] }) {
    return (
        <div className="p-4 border rounded-lg shadow-sm">
            <p className="font-medium mb-2">{question}</p>
            <ul className="list-disc pl-5">
                {options.map((option, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                        {option}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Upload() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [summary, setSummary] = useState<string>("");
    const [keyConcepts, setKeyConcepts] = useState<{ key_concept: string; description: string }[] | null>(null); // Initialize as null
    const [topics, setTopics] = useState<string[] | null>(null); // Initialize as null
    const [quizzes, setQuizzes] = useState<{ question: string; options: string[] }[] | null>(null); // Initialize as null
    const [loading, setLoading] = useState<boolean>(false);

    const processFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setFile(e.target.files[0]);
        console.log('File selected!');
    };

    const handleFileUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLoading(true);
        if (!file) {
            console.log('Please select a file first!');
            setLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append('pdf_file', file);
        try {
            const res = await axios.post<{
                summary: string;
                key_concepts: { key_concept: string; description: string }[];
                topics: string[];
                quizzes: { question: string; options: string[] }[];
            }>('http://127.0.0.1:8000/content/generate_summary', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Validate and format the response
            const formattedSummary = res.data.summary.trim();
            const formattedKeyConcepts = Array.isArray(res.data.key_concepts)
                ? res.data.key_concepts.map((concept) => ({
                      key_concept: concept.key_concept,
                      description: concept.description,
                  }))
                : [];
            const formattedTopics = Array.isArray(res.data.topics)
                ? res.data.topics.map((topic) => topic)
                : [];
            const formattedQuizzes = Array.isArray(res.data.quizzes)
                ? res.data.quizzes.map((quiz) => ({ 
                      question: quiz.question.trim(),
                      options: Array.isArray(quiz.options)
                          ? quiz.options.map((option) => option.trim())
                          : [],
                  }))
                : [];

            setSummary(formattedSummary);
            setKeyConcepts(formattedKeyConcepts);
            setTopics(formattedTopics);
            setQuizzes(formattedQuizzes);

            console.log('File uploaded and processed successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            console.log('Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen">
            <div className="flex flex-col items-center p-8 gap-8 font-[family-name:var(--font-geist-sans)]">
                <form className="flex flex-col gap-4 w-full max-w-sm">
                    <label className="flex flex-col gap-2">
                        <input
                            type="file"
                            className="p-2 border border-solid border-black/[.08] dark:border-white/[.145]"
                            onChange={processFile}
                            accept="application/pdf"
                        />
                    </label>
                    <button
                        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm h-10 px-4"
                        onClick={handleFileUpload}
                        type="button"
                    >
                        Upload
                    </button>
                </form>
            </div>
            <div className="flex flex-col items-center w-full max-w-3xl mt-8 gap-6">
                {summary && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg w-full shadow-sm border border-green-100 dark:border-green-800">
                        <h2 className="text-xl font-semibold mb-2">Summary</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
                    </div>
                )}
                {keyConcepts && keyConcepts.length > 0 && ( // Check if keyConcepts is not null before accessing length
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg w-full shadow-sm border border-blue-100 dark:border-blue-800">
                        <h2 className="text-xl font-semibold mb-3">Key Concepts</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {keyConcepts.map((concept, index) => (
                                <KeyConceptCard key={index} concept={concept.key_concept} description={concept.description} file={file} />
                            ))}
                        </div>
                    </div>
                )}
                {topics && topics.length > 0 && ( // Check if topics is not null before accessing length
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg w-full shadow-sm border border-yellow-100 dark:border-yellow-800">
                        <h2 className="text-xl font-semibold mb-3">Topics</h2>
                        <ul className="list-disc pl-5">
                            {topics.map((topic, index) => (
                                <li key={index} className="text-gray-700 dark:text-gray-300">
                                    {topic}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {quizzes && quizzes.length > 0 && ( // Check if quizzes is not null before accessing length
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg w-full shadow-sm border border-purple-100 dark:border-purple-800">
                        <h2 className="text-xl font-semibold mb-3">Quizzes</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quizzes.map((quiz, index) => (
                                <QuizCard key={index} question={quiz.question} options={quiz.options} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}














