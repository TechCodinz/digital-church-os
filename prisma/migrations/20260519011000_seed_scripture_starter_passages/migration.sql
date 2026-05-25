INSERT INTO scripture_passages (version_code, book, chapter, verse_start, verse_end, reference, text, topics, emotions)
VALUES
('KJV', 'Psalms', 34, 18, NULL, 'Psalm 34:18', 'The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.', ARRAY['comfort','care','healing'], ARRAY['sadness','grief','hope']),
('KJV', 'Matthew', 11, 28, NULL, 'Matthew 11:28', 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', ARRAY['rest','burden','invitation'], ARRAY['weariness','hope','peace']),
('KJV', 'Micah', 6, 8, NULL, 'Micah 6:8', 'He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?', ARRAY['justice','mercy','discipleship'], ARRAY['conviction','purpose']),
('KJV', '2 Timothy', 3, 16, NULL, '2 Timothy 3:16', 'All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.', ARRAY['scripture','teaching','doctrine'], ARRAY['wisdom','discipline']),
('KJV', 'Colossians', 3, 16, NULL, 'Colossians 3:16', 'Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs...', ARRAY['worship','teaching','community'], ARRAY['gratitude','joy']),
('WEB', 'Psalms', 34, 18, NULL, 'Psalm 34:18', 'Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit.', ARRAY['comfort','care','healing'], ARRAY['sadness','grief','hope']),
('WEB', 'Matthew', 11, 28, NULL, 'Matthew 11:28', 'Come to me, all you who labor and are heavily burdened, and I will give you rest.', ARRAY['rest','burden','invitation'], ARRAY['weariness','hope','peace']),
('WEB', 'Micah', 6, 8, NULL, 'Micah 6:8', 'He has shown you, O man, what is good. What does Yahweh require of you, but to act justly, to love mercy, and to walk humbly with your God?', ARRAY['justice','mercy','discipleship'], ARRAY['conviction','purpose']),
('WEB', '2 Timothy', 3, 16, NULL, '2 Timothy 3:16', 'Every Scripture is God-breathed and profitable for teaching, for reproof, for correction, and for instruction in righteousness.', ARRAY['scripture','teaching','doctrine'], ARRAY['wisdom','discipline']),
('WEB', 'Colossians', 3, 16, NULL, 'Colossians 3:16', 'Let the word of Christ dwell in you richly; in all wisdom teaching and admonishing one another with psalms, hymns, and spiritual songs...', ARRAY['worship','teaching','community'], ARRAY['gratitude','joy'])
ON CONFLICT (version_code, reference) DO UPDATE SET
  text = EXCLUDED.text,
  topics = EXCLUDED.topics,
  emotions = EXCLUDED.emotions;
