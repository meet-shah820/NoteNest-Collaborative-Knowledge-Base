import express, { Request, Response } from 'express';
import Note from '../models/Note';
import { AuditService } from '../services/auditService';

const router = express.Router();

// Get all notes for a workspace
router.get('/workspace/:workspaceId', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const notes = await Note.find({ workspaceId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, workspaceId, authorId } = req.body;
    const note = new Note({
      title,
      content,
      workspaceId,
      author: authorId,
    });
    await note.save();

    // Log the event
    await AuditService.logEvent(
      'note_created',
      authorId,
      workspaceId,
      note._id.toString(),
      'note',
      { title }
    );

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, authorId } = req.body;
    const note = await Note.findByIdAndUpdate(
      id,
      { title, content, updatedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Log the event
    await AuditService.logEvent(
      'note_updated',
      authorId,
      note.workspaceId.toString(),
      id,
      'note',
      { title }
    );

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { authorId } = req.body;
    const note = await Note.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Log the event
    await AuditService.logEvent(
      'note_deleted',
      authorId,
      note.workspaceId.toString(),
      id,
      'note',
      { title: note.title }
    );

    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
