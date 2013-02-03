cfr
===

jQuery plugin for chunked file reading.

### Basic setup

```javascript
$('input[type=file]').cfr();
```

### Options

* `chunkSize` - chunk size in bytes.
* `readFunc` - function to call on [FileReader](https://developer.mozilla.org/en-US/docs/DOM/FileReader) (`readAsDataURL` by default ).
* `filter` - function to call on chunk before pass it to `onChunk` callback (`function (c) { return c.substr(c.indexOf(',') + 1); }` by default).

If you override a `readFunc` you also need override a default `filter` or pass it a `null`.

### Callbacks

* `onStart(file)` - will be called before reading first chunk.
  * `file` - [File](https://developer.mozilla.org/en-US/docs/DOM/File) object.
* `onChunk(chunk, size, chunkNum, chunks, cb)` - will be called on each chunk.
  * `chunk` - output of `filter` function if present. Instead a result of FileReaders `onloadend` event.
  * `size` - count of bytes read from `file`.
  * `chunkNum` - number of chunk.
  * `chunks` - count of chunks in file.
  * `cb` - function you must call to continue reading. You also can call `cb(true)` to cancel reading and trigger `onCancel` callback.
* `onCancel(file)` - will be called after `cb(true)` or `.cfr('cancel')`.
  * `file` - [File](https://developer.mozilla.org/en-US/docs/DOM/File) object.
* `onEnd(file)` - will be called after last chunk read.
  * `file` - [File](https://developer.mozilla.org/en-US/docs/DOM/File) object.

### Methods

* `.cfr('cancel')` - cancel reading process
* `.cfr('remove')` - removing *cfr* from element (does not abort read process)

### Example

See test.html for complete example.