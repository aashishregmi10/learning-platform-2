/**
 * Bilingual labels for the teacher-facing screens.
 *
 * Rules for anything added here:
 *  - Say what the teacher gets, not what the database stores. "Students can see
 *    this" beats "Published"; "Written notes" beats "note".
 *  - No jargon a non-technical teacher would have to learn: no "content type",
 *    no "order", no "entity", no "draft".
 *  - Keep sentences short — these are read on a phone half the time.
 *
 * NOTE: the Nepali strings below are a first pass and should be reviewed by a
 * native speaker before this ships to real teachers.
 */
export const LANGUAGES = {
  en: { label: "English", short: "EN" },
  np: { label: "नेपाली", short: "ने" },
};

export const strings = {
  // ---- navigation ------------------------------------------------------
  "nav.dashboard": { en: "Dashboard", np: "ड्यासबोर्ड" },
  "nav.mySubjects": { en: "My Subjects", np: "मेरा विषयहरू" },
  "nav.allSubjects": { en: "All subjects", np: "सबै विषयहरू" },
  "nav.quizzes": { en: "Quizzes", np: "क्विजहरू" },
  "nav.liveClasses": { en: "Live Classes", np: "लाइभ कक्षाहरू" },
  "nav.questions": { en: "Student Questions", np: "विद्यार्थीका प्रश्नहरू" },

  // ---- subject home menu ----------------------------------------------
  "subject.backToSubjects": { en: "Back to my subjects", np: "मेरा विषयहरूमा फर्कनुहोस्" },
  "subject.whatToDo": { en: "What would you like to do?", np: "तपाईं के गर्न चाहनुहुन्छ?" },
  "subject.lessons": { en: "Lessons", np: "पाठहरू" },
  "subject.lessonsDesc": {
    en: "Add chapters and the notes, PDFs and videos inside them.",
    np: "अध्याय र तिनका नोट, PDF अनि भिडियो थप्नुहोस्।",
  },
  "subject.quizzesDesc": {
    en: "Set questions for students to answer after a chapter.",
    np: "अध्यायपछि विद्यार्थीले उत्तर दिने प्रश्न राख्नुहोस्।",
  },
  "subject.questionsDesc": {
    en: "Read and answer what your students have asked.",
    np: "विद्यार्थीले सोधेका प्रश्न पढ्नुहोस् र जवाफ दिनुहोस्।",
  },
  "subject.liveDesc": {
    en: "Schedule a class and meet your students online.",
    np: "कक्षा तालिका बनाउनुहोस् र अनलाइन भेट्नुहोस्।",
  },
  "subject.visibleToStudents": { en: "Students can see this subject", np: "विद्यार्थीले यो विषय देख्न सक्छन्" },
  "subject.hiddenFromStudents": { en: "Not visible to students yet", np: "अहिलेसम्म विद्यार्थीले देख्दैनन्" },
  "subject.showToStudents": { en: "Show to students", np: "विद्यार्थीलाई देखाउनुहोस्" },
  "subject.hideFromStudents": { en: "Hide from students", np: "विद्यार्थीबाट लुकाउनुहोस्" },

  // ---- chapters --------------------------------------------------------
  "chapter.one": { en: "Chapter", np: "अध्याय" },
  "chapter.count": { en: "chapters", np: "अध्यायहरू" },
  "chapter.add": { en: "Add a chapter", np: "अध्याय थप्नुहोस्" },
  "chapter.addFirst": { en: "Add your first chapter", np: "पहिलो अध्याय थप्नुहोस्" },
  "chapter.emptyTitle": { en: "No chapters yet", np: "अझै कुनै अध्याय छैन" },
  "chapter.emptyBody": {
    en: "Chapters hold your lessons. Start by adding the first one — you can rename it any time.",
    np: "अध्यायभित्र तपाईंका पाठ रहन्छन्। पहिलो अध्याय थपेर सुरु गर्नुहोस् — नाम पछि पनि बदल्न सकिन्छ।",
  },
  "chapter.nameLabel": { en: "Chapter name", np: "अध्यायको नाम" },
  "chapter.namePlaceholder": { en: "e.g. Atomic Structure", np: "जस्तै: परमाणु संरचना" },
  "chapter.nameHelp": {
    en: "Use the name your students will recognise from the syllabus.",
    np: "पाठ्यक्रममा विद्यार्थीले चिन्ने नाम राख्नुहोस्।",
  },
  "chapter.freeLabel": { en: "Let anyone open this chapter for free", np: "यो अध्याय सबैलाई नि:शुल्क खोल्न दिनुहोस्" },
  "chapter.freeHelp": {
    en: "Useful for a sample chapter. Everything else needs a purchase.",
    np: "नमुना अध्यायका लागि उपयोगी। बाँकी सामग्री किन्नुपर्छ।",
  },
  "chapter.rename": { en: "Rename chapter", np: "अध्यायको नाम बदल्नुहोस्" },
  "chapter.delete": { en: "Delete chapter", np: "अध्याय हटाउनुहोस्" },
  "chapter.lessonCount": { en: "lessons", np: "पाठहरू" },
  "chapter.noLessons": { en: "Nothing in this chapter yet.", np: "यो अध्यायमा अझै केही छैन।" },
  "chapter.lastEdited": { en: "Last edited", np: "अन्तिम सम्पादन" },
  "chapter.open": { en: "Open chapter", np: "अध्याय खोल्नुहोस्" },
  "chapter.manageTopics": { en: "Manage topics", np: "विषयवस्तु व्यवस्थापन" },
  "chapter.backToChapters": { en: "Back to chapters", np: "अध्यायहरूमा फर्कनुहोस्" },
  "chapter.settings": { en: "Chapter settings", np: "अध्याय सेटिङ" },
  "topic.emptyTitle": { en: "No topics in this chapter yet", np: "यस अध्यायमा अझै कुनै विषयवस्तु छैन" },
  "topic.emptyBody": {
    en: "Topics are the notes, PDFs and videos your students actually open. Add the first one to get started.",
    np: "विषयवस्तु भनेको विद्यार्थीले खोल्ने नोट, PDF र भिडियो हुन्। सुरु गर्न पहिलो थप्नुहोस्।",
  },
  "topic.count": { en: "topics", np: "विषयवस्तुहरू" },
  "topic.add": { en: "Add a topic", np: "विषयवस्तु थप्नुहोस्" },
  "topic.addFirst": { en: "Add the first topic", np: "पहिलो विषयवस्तु थप्नुहोस्" },

  // ---- visibility, in plain words -------------------------------------
  "visible.yes": { en: "Students can see this", np: "विद्यार्थीले देख्न सक्छन्" },
  "visible.no": { en: "Only you can see this", np: "तपाईंले मात्र देख्न सक्नुहुन्छ" },
  "visible.show": { en: "Show to students", np: "विद्यार्थीलाई देखाउनुहोस्" },
  "visible.hide": { en: "Hide from students", np: "विद्यार्थीबाट लुकाउनुहोस्" },
  "visible.free": { en: "Free for everyone", np: "सबैका लागि नि:शुल्क" },

  // ---- lessons ---------------------------------------------------------
  "lesson.add": { en: "Add a lesson", np: "पाठ थप्नुहोस्" },
  "lesson.addFirst": { en: "Add the first lesson", np: "पहिलो पाठ थप्नुहोस्" },
  "lesson.kindQuestion": { en: "What are you adding?", np: "तपाईं के थप्दै हुनुहुन्छ?" },
  "lesson.titleLabel": { en: "What is this lesson called?", np: "यो पाठको नाम के हो?" },
  "lesson.titlePlaceholder": { en: "e.g. Bohr's Atomic Theory", np: "जस्तै: बोरको परमाणु सिद्धान्त" },
  "lesson.notesLabel": { en: "Write your notes here", np: "यहाँ आफ्ना नोट लेख्नुहोस्" },
  "lesson.notesPlaceholder": {
    en: "Type or paste your notes. Students read these on screen.",
    np: "आफ्ना नोट टाइप गर्नुहोस् वा टाँस्नुहोस्। विद्यार्थीले स्क्रिनमा पढ्छन्।",
  },
  "lesson.linkLabel": { en: "Paste the web address", np: "वेब ठेगाना टाँस्नुहोस्" },
  "lesson.fileChoose": { en: "Choose a file from your computer", np: "आफ्नो कम्प्युटरबाट फाइल छान्नुहोस्" },
  "lesson.fileChosen": { en: "File chosen", np: "फाइल छानियो" },
  "lesson.freeLabel": { en: "Let anyone open this lesson for free", np: "यो पाठ सबैलाई नि:शुल्क खोल्न दिनुहोस्" },
  "lesson.delete": { en: "Delete lesson", np: "पाठ हटाउनुहोस्" },
  "lesson.fileReplaceHint": {
    en: "To swap the uploaded file, delete this lesson and add it again. The title and settings below can still be changed.",
    np: "अपलोड गरिएको फाइल बदल्न यो पाठ हटाएर फेरि थप्नुहोस्। तलको शीर्षक र सेटिङ भने अहिले पनि बदल्न सकिन्छ।",
  },
  "lesson.uploading": { en: "Uploading…", np: "अपलोड हुँदैछ…" },

  // lesson kinds — what it IS to a teacher, not the enum value
  "kind.note": { en: "Written notes", np: "लिखित नोट" },
  "kind.noteDesc": { en: "Type or paste notes students read on screen.", np: "विद्यार्थीले स्क्रिनमा पढ्ने नोट लेख्नुहोस्।" },
  "kind.pdf": { en: "PDF handout", np: "PDF पाना" },
  "kind.pdfDesc": { en: "Upload a PDF students can read and download.", np: "विद्यार्थीले पढ्न र डाउनलोड गर्न मिल्ने PDF अपलोड गर्नुहोस्।" },
  "kind.video": { en: "Video lesson", np: "भिडियो पाठ" },
  "kind.videoDesc": { en: "Upload a recorded lesson from your computer.", np: "कम्प्युटरबाट रेकर्ड गरिएको पाठ अपलोड गर्नुहोस्।" },
  "kind.link": { en: "Web link", np: "वेब लिंक" },
  "kind.linkDesc": { en: "Point students to a page or video elsewhere.", np: "अन्यत्रको पृष्ठ वा भिडियोमा विद्यार्थी पठाउनुहोस्।" },

  // ---- note editor -----------------------------------------------------
  "editor.bold": { en: "Bold", np: "बोल्ड" },
  "editor.italic": { en: "Italic", np: "इटालिक" },
  "editor.heading": { en: "Heading", np: "शीर्षक" },
  "editor.bullets": { en: "Bullet list", np: "बुलेट सूची" },
  "editor.numbers": { en: "Numbered list", np: "क्रमाङ्कित सूची" },
  "editor.quote": { en: "Quote", np: "उद्धरण" },
  "editor.insertImage": { en: "Add a picture", np: "तस्बिर थप्नुहोस्" },
  "editor.imageHint": { en: "Add a picture anywhere in your notes", np: "नोटमा जहाँसुकै तस्बिर थप्नुहोस्" },
  "editor.uploadingImage": { en: "Adding your picture…", np: "तस्बिर थपिँदैछ…" },
  "editor.placeImage": { en: "Where should this picture sit?", np: "यो तस्बिर कहाँ राख्ने?" },
  "editor.alignLeft": { en: "Text on the right", np: "पाठ दायाँ" },
  "editor.alignCenter": { en: "Full width", np: "पूरा चौडाइ" },
  "editor.alignRight": { en: "Text on the left", np: "पाठ बायाँ" },
  "editor.removeImage": { en: "Remove this picture", np: "यो तस्बिर हटाउनुहोस्" },
  "editor.wysiwygHint": {
    en: "Your notes appear to students exactly as they look here. Click a picture to move it.",
    np: "यहाँ देखिएकै रूपमा विद्यार्थीले नोट देख्नेछन्। तस्बिर सार्न त्यसमा क्लिक गर्नुहोस्।",
  },

  // ---- editing & preview ----------------------------------------------
  "lesson.edit": { en: "Edit lesson", np: "पाठ सम्पादन गर्नुहोस्" },
  "lesson.editTitle": { en: "Edit this lesson", np: "यो पाठ सम्पादन गर्नुहोस्" },
  "preview.open": { en: "See what students see", np: "विद्यार्थीले देख्ने हेर्नुहोस्" },
  "preview.title": { en: "Student's view", np: "विद्यार्थीको दृश्य" },
  "preview.explain": {
    en: "This is exactly how the lesson appears to a student.",
    np: "विद्यार्थीलाई पाठ ठ्याक्कै यसरी देखिन्छ।",
  },
  "preview.close": { en: "Back to editing", np: "सम्पादनमा फर्कनुहोस्" },
  "preview.emptyNote": { en: "This note is still empty.", np: "यो नोट अझै खाली छ।" },
  "preview.fileNote": {
    en: "Students open this file from the lesson list.",
    np: "विद्यार्थीले पाठ सूचीबाट यो फाइल खोल्छन्।",
  },
  "preview.linkNote": { en: "Students are taken to:", np: "विद्यार्थी यहाँ पुग्छन्:" },

  // ---- generic actions -------------------------------------------------
  "action.save": { en: "Save", np: "सुरक्षित गर्नुहोस्" },
  "action.edit": { en: "Edit", np: "सम्पादन" },
  "action.cancel": { en: "Cancel", np: "रद्द गर्नुहोस्" },
  "action.delete": { en: "Delete", np: "हटाउनुहोस्" },
  "action.back": { en: "Back", np: "पछाडि" },
  "action.done": { en: "Done", np: "भयो" },
  "action.saved": { en: "Saved", np: "सुरक्षित भयो" },
  "action.saving": { en: "Saving…", np: "सुरक्षित हुँदैछ…" },
  "action.saveFailed": { en: "Could not save", np: "सुरक्षित गर्न सकिएन" },

  // ---- delete confirmation --------------------------------------------
  "confirm.title": { en: "Are you sure?", np: "के तपाईं निश्चित हुनुहुन्छ?" },
  "confirm.cannotUndo": { en: "This cannot be undone.", np: "यो फिर्ता गर्न सकिँदैन।" },
  "confirm.deleteChapter": {
    en: "Everything inside this chapter will be removed too.",
    np: "यस अध्यायभित्रका सबै कुरा पनि हट्नेछन्।",
  },

  // ---- questions -------------------------------------------------------
  "questions.waiting": { en: "Waiting for your answer", np: "तपाईंको जवाफ पर्खिरहेको" },
  "questions.answered": { en: "Answered", np: "जवाफ दिइयो" },
  "questions.none": { en: "No questions yet.", np: "अझै कुनै प्रश्न छैन।" },
  "questions.allAnswered": {
    en: "Nothing waiting on you — every question has an answer.",
    np: "तपाईंलाई पर्खिरहेको केही छैन — सबै प्रश्नको जवाफ छ।",
  },
};

export default strings;
