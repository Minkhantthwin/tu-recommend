/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "multer" {
  import { Request, RequestHandler } from "express";

  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    preservePath?: boolean;
    fileFilter?(
      req: Request,
      file: File,
      callback: (error: Error | null, acceptFile?: boolean) => void,
    ): void;
  }

  interface StorageEngine {
    _handleFile(
      req: Request,
      file: File,
      callback: (error?: any, info?: Partial<File>) => void,
    ): void;
    _removeFile(
      req: Request,
      file: File,
      callback: (error: Error | null) => void,
    ): void;
  }

  interface DiskStorageOptions {
    destination?:
      | string
      | ((
          req: Request,
          file: File,
          callback: (error: Error | null, destination: string) => void,
        ) => void);
    filename?(
      req: Request,
      file: File,
      callback: (error: Error | null, filename: string) => void,
    ): void;
  }

  interface Multer {
    (options?: Options): RequestHandler;
    single(fieldname: string): RequestHandler;
    array(fieldname: string, maxCount?: number): RequestHandler;
    fields(fields: Array<{ name: string; maxCount?: number }>): RequestHandler;
    none(): RequestHandler;
    any(): RequestHandler;
  }

  function multer(options?: Options): Multer;

  namespace multer {
    function diskStorage(options: DiskStorageOptions): StorageEngine;
    function memoryStorage(): StorageEngine;
  }

  export = multer;
}

export {};
